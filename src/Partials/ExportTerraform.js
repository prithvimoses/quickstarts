import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

class ExportTerraform extends React.Component {

    constructor(props) {
        super(props);

        this.copyToClipboard = this.copyToClipboard.bind(this);

        this.state = {
            output: ExportTerraform.generate(props.json)
        }
    }

    static removeNewlines(line) {
       return line.replace(/(\r\n|\n|\r)/gm, "");
    }

    static generate(json) {
        let output = [];

        try {
            output.push('data "newrelic_application" "my_application" {');
            output.push('  name = "My Application"');
            output.push('}');
            output.push('');

            output.push('resource "newrelic_dashboard" "exampledash" {');
            output.push('  title = "' + json.title + '"');
            if (json.icon) {
                output.push('  icon = "' + json.icon + '"');
            }
            if (json.visibility) {
                output.push('  visibility = "' + json.visibility + '"');
            }
            if (json.editable) {
                output.push('  editable = "' + json.editable + '"');
            }
            output.push('');

            output.push('  filter {');
            output.push('    event_types = [');
            output.push(json.filter.event_types.map((eventType) => '        "' + eventType + '"').join(', \n'));
            output.push('    ]');
            if (json.filter.attributes) {
                output.push('    attributes = [');
                output.push(json.filter.attributes.map((attribute) => '        "' + attribute + '"').join(', \n'));
                output.push('    ]');
            }
            output.push('  }');
            output.push('');

            output = output.concat(json.widgets.map((widget) => {
                let widgetOutput = [];

                widgetOutput.push('  widget {');
                widgetOutput.push('    title = "' + widget.title + '"');
                widgetOutput.push('    visualization = "' + widget.process_as + '"');
                widgetOutput.push('    row = ' + widget.row);
                widgetOutput.push('    column = ' + widget.column);
                if (widget.width) {
                    widgetOutput.push('    width = ' + widget.width);
                }
                if (widget.height) {
                    widgetOutput.push('    height = ' + widget.height);
                }
                if (widget.notes) {
                    widgetOutput.push('    notes = "' + widget.notes + '"');
                }
                if (widget.nrql) {
                    widgetOutput.push('    nrql = "' + ExportTerraform.removeNewlines(widget.nrql) + '"');
                }
                if (widget.threshold_red) {
                    widgetOutput.push('    threshold_red = "' + widget.threshold_red + '"');
                }
                if (widget.threshold_yellow) {
                    widgetOutput.push('    threshold_yellow = "' + widget.threshold_yellow + '"');
                }

                widgetOutput.push('  }');

                widgetOutput.push('');

                return widgetOutput.join('\n');
            }));

            output.push('}');
        } catch {
            output = []
            output.push('Error while building the Terraform template');
            output.push('Please check your json input or create a bug report');
        }

        return output.join('\n');
    }

    copyToClipboard() {
        navigator.permissions.query({name: "clipboard-write"}).then(result => {
            if (result.state === "granted" || result.state === "prompt") {
                navigator.clipboard.writeText(this.state.output).then(function() {
                    alert('Terraform template copied to clipboard');
                }, function(error) {
                    console.log('error', error);
                    alert('Failed to copy terraform template to clipboard');
                });
            }
        });
    }

    static getDerivedStateFromProps(props, state) {
        if (state.json !== props.json) {
            return {
                output: ExportTerraform.generate(props.json),
            }
        }
        return null
    }

    render() {
        return (
            <div className="terraform">
                <div className="col-12 text-right">
                    <button className="btn btn-sm btn-outline-info" onClick={this.copyToClipboard}>Copy to clipboard</button>
                </div>
                <div className="col-12">
                    <SyntaxHighlighter language="ruby" style={docco}>
                        {this.state.output}
                    </SyntaxHighlighter>
                </div>
            </div>
        );
    }

}

export default ExportTerraform;
